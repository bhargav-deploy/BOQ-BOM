"use server";

import { prisma } from "@/lib/prisma";

export async function processMessage(message: string): Promise<string> {
    const text = message.trim();
    if (!text) return "Please type something.";

    const lowerText = text.toLowerCase();

    // 1. Intent: Greeting
    if (["hi", "hello", "hey", "start", "menu"].some(w => lowerText === w || lowerText.startsWith(w + " "))) {
        return "Hello! 👋 I'm your Sales Assistant.\n\nI can help you with:\n🔍 **Checking Prices** (e.g., 'Price of Cisco Switch')\n📦 **Stock Availability**\n📞 **Contacting Support**\n\nJust type what you need!";
    }

    // 2. Intent: Help / Contact
    if (["help", "support", "contact", "agent", "human"].some(w => lowerText.includes(w))) {
        return "📞 **Contact Support**\n\nYou can reach our sales team at:\n📧 sales@company.com\n📱 +1-234-567-890\n\nOr just ask me about a product!";
    }

    // 3. Intent: Product Search
    // Remove common filler words to improve search quality
    const query = text.replace(/^(price|cost|check|find|search|show|me|of|for|the)\s+/i, "").trim();

    if (query.length < 2) {
        return "Could you please be more specific? I need at least 2 characters to search for a product.";
    }

    // Search logic: Match Part Code OR Name
    const products = await prisma.product.findMany({
        where: {
            OR: [
                { partCode: { contains: query } }, // removed mode: insensitive for compatibility, adjust if needed
                { name: { contains: query } }
            ]
        },
        include: {
            prices: {
                orderBy: { effectiveDate: "desc" },
                take: 1
            }
        },
        take: 5 // Limit to 5 results to avoid spamming
    });

    if (products.length === 0) {
        return `❌ Sorry, I couldn't find any products matching "${query}".\n\nPlease try:\n- Checking the Part Code\n- Using a simpler keyword (e.g. "Switch")`;
    }

    if (products.length === 1) {
        const product = products[0];
        const priceEntry = product.prices[0];
        const price = priceEntry
            ? new Intl.NumberFormat('en-US', { style: 'currency', currency: priceEntry.currency }).format(priceEntry.price)
            : "Price on Request";
        const oem = priceEntry?.vendor || "Unknown OEM";

        return `✅ **Found it!**\n\n*${product.partCode}*\n${product.name}\n\n💲 Price: ${price}\n🏭 OEM: ${oem}`;
    }

    // Multiple results
    let response = `🔎 I found ${products.length} products matching "${query}":\n\n`;
    products.forEach((p, i) => {
        const priceEntry = p.prices[0];
        const price = priceEntry
            ? new Intl.NumberFormat('en-US', { style: 'currency', currency: priceEntry.currency }).format(priceEntry.price)
            : "N/A";
        response += `${i + 1}. *${p.partCode}* - ${price}\n   _${p.name.substring(0, 50)}${p.name.length > 50 ? "..." : ""}_\n`;
    });
    response += `\nReply with the exact Part Code for details.`;

    return response;
}
