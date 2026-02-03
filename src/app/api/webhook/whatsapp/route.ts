import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "@/app/actions/chat";

// Token for verification - you set this in Meta Dashboard
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "my_secure_token_123";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("WEBHOOK_VERIFIED");
        return new NextResponse(challenge, { status: 200 });
    }

    return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Check if this is a message from WhatsApp
        if (
            body.object === "whatsapp_business_account" &&
            body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0].value.messages &&
            body.entry[0].changes[0].value.messages[0]
        ) {
            const message = body.entry[0].changes[0].value.messages[0];
            const from = message.from; // Phone number
            const msgBody = message.text?.body;
            const messageType = message.type;

            // Only handle text messages for now
            if (messageType === 'text' && msgBody) {
                console.log(`Received message from ${from}: ${msgBody}`);

                // 1. Process the message using our Chat Logic
                const replyText = await processMessage(msgBody);

                // 2. Send the reply back to WhatsApp
                await sendWhatsAppMessage(from, replyText);
            }
        }

        return new NextResponse("EVENT_RECEIVED", { status: 200 });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

async function sendWhatsAppMessage(to: string, text: string) {
    if (!WHATSAPP_TOKEN) {
        console.warn("WHATSAPP_TOKEN is not set. Cannot reply to real WhatsApp.");
        return;
    }

    // You need your Phone Number ID from Meta Dashboard
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID;

    if (!PHONE_NUMBER_ID) {
        console.warn("WHATSAPP_PHONE_ID is not set. Cannot reply.");
        return;
    }

    try {
        const res = await fetch(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: to,
                text: { body: text },
            }),
        });

        if (!res.ok) {
            const err = await res.json();
            console.error("Failed to send WhatsApp reply:", err);
        } else {
            console.log(`Reply sent to ${to}`);
        }
    } catch (e) {
        console.error("Network error sending WhatsApp reply:", e);
    }
}
