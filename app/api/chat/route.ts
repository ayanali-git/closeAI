import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthUser, supabaseAdmin } from '@/lib/supabase-server';
import { aiService } from '@/lib/ai-service';
import { subscriptionService } from '@/lib/subscription-service';

export async function POST(request: NextRequest) {
    try {
        const { user, error: authError } = await getServerAuthUser(request);
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { message, chatId, files, truncateMessageId, model } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Check usage limits
        const usageCheck = await subscriptionService.checkUsageLimit(user.id, 'messages');
        if (!usageCheck.allowed) {
            return NextResponse.json({
                error: 'Daily message limit reached',
                code: 'LIMIT_EXCEEDED',
                limit: usageCheck.limit,
                remaining: usageCheck.remaining,
                upgradeUrl: '/upgrade',
            }, { status: 429 });
        }

        let currentChatId = chatId;
        let chatTitle = message.trim().replace(/\s+/g, ' ');

        // If no chatId, create a new chat
        if (!currentChatId) {
            const { data: newChat, error: chatError } = await supabaseAdmin
                .from('chats')
                .insert({
                    user_id: user.id,
                    title: chatTitle,
                    starred: false,
                })
                .select()
                .single();

            if (chatError) {
                console.error('Error creating chat:', chatError);
                return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
            }

            currentChatId = newChat.id;
        }

        // If editing/regenerating from a specific message, delete that message and subsequent messages
        if (truncateMessageId) {
            try {
                const { data: targetMsg } = await supabaseAdmin
                    .from('messages')
                    .select('created_at')
                    .eq('id', truncateMessageId)
                    .single();

                if (targetMsg?.created_at) {
                    await supabaseAdmin
                        .from('messages')
                        .delete()
                        .eq('chat_id', currentChatId)
                        .gte('created_at', targetMsg.created_at);
                }
            } catch (truncError) {
                console.error('Error truncating messages for edit:', truncError);
            }
        }

        // Get previous messages for context
        const { data: previousMessages, error: msgError } = await supabaseAdmin
            .from('messages')
            .select('role, content')
            .eq('chat_id', currentChatId)
            .order('created_at', { ascending: true });

        if (msgError) {
            console.error('Error fetching messages:', msgError);
        }

        // Create user message in database
        const { data: userMessage, error: userMsgError } = await supabaseAdmin
            .from('messages')
            .insert({
                chat_id: currentChatId,
                role: 'user',
                content: message,
                metadata: files && files.length > 0 ? { files } : null,
            })
            .select()
            .single();

        if (userMsgError) {
            console.error('Error saving user message:', userMsgError);
            return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
        }

        // Prepare messages for AI
        const aiMessages = [
            ...(previousMessages || []).map((msg: any) => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
            })),
            { role: 'user' as const, content: message },
        ];

        // Extract image URLs from files if any
        const imageUrls = files
            ?.filter((f: any) => f.type?.startsWith('image/'))
            ?.map((f: any) => f.url) || [];

        // Generate AI response
        let aiResponse;
        try {
            aiResponse = await aiService.generateResponse(aiMessages, undefined, imageUrls, model || "GPT-5.4");
        } catch (aiError: any) {
            console.error('AI generation error:', aiError);
            aiResponse = {
                content: `I encountered an issue while generating a response: ${aiError.message || 'Unknown error'}. Please try again.`,
            };
        }

        // Save assistant message
        const { data: assistantMessage, error: assistantMsgError } = await supabaseAdmin
            .from('messages')
            .insert({
                chat_id: currentChatId,
                role: 'assistant',
                content: aiResponse.content,
                metadata: model ? { model } : null,
            })
            .select()
            .single();

        if (assistantMsgError) {
            console.error('Error saving assistant message:', assistantMsgError);
            return NextResponse.json({ error: 'Failed to save response' }, { status: 500 });
        }

        // Update chat's updated_at
        await supabaseAdmin
            .from('chats')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', currentChatId);

        return NextResponse.json({
            chatId: currentChatId,
            userMessage: {
                id: userMessage.id,
                role: 'user',
                content: message,
                createdAt: userMessage.created_at,
                chatId: currentChatId,
                files: files || [],
            },
            assistantMessage: {
                id: assistantMessage.id,
                role: 'assistant',
                content: aiResponse.content,
                createdAt: assistantMessage.created_at,
                chatId: currentChatId,
                model: model || "GPT-5.4",
            },
        });

    } catch (error: any) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
