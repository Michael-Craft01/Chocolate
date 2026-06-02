function parseRefined(text: string): string {
  const startIdx = text.lastIndexOf('{');
  const endIdx = text.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      try {
          const jsonStr = text.substring(startIdx, endIdx + 1);
          const parsed = JSON.parse(jsonStr);
          if (parsed && typeof parsed.refined === 'string') {
              return parsed.refined.trim();
          }
      } catch (e) {
          console.warn(`Failed to parse extracted JSON: ${e}`);
      }
  }
  
  // Fallback: if JSON parsing fails, try regex for the refined key
  const refinedRegex = /"refined"\s*:\s*"([\s\S]*?)"\s*}/;
  const regexMatch = text.match(refinedRegex);
  if (regexMatch && regexMatch[1]) {
      return regexMatch[1].replace(/\\"/g, '"').trim();
  }

  return text.replace(/<[^>]*>?/gm, '').trim();
}

const mockResponse1 = `*   Input: "point of sale offline"
    *   Product: LogicHQ
    *   Goal: Refine into a professional B2B description.
    *   Constraint: Output must be a valid, parseable JSON object with the key "refined". No extra text.

    *   "point of sale offline" -> Offline POS capabilities.
    *   Context: LogicHQ (likely a business management or POS software).
    *   Professional B2B phrasing: "Robust offline point-of-sale capabilities," "Ensures business continuity with offline POS functionality," "Seamless offline transaction processing."

    *   *Option 1:* "LogicHQ offers robust offline point-of-sale capabilities, ensuring uninterrupted business operations regardless of connectivity."
    *   *Option 2:* "Experience seamless business continuity with LogicHQ's offline point-of-sale functionality, allowing for uninterrupted transaction processing."
    *   *Option 3:* "LogicHQ provides a resilient offline point-of-sale solution, ensuring your business remains operational and capable of processing sales even during network outages."

    *   Option 1 is concise and professional.

    *   \`{"refined": "LogicHQ provides robust offline point-of-sale capabilities, ensuring uninterrupted business operations and seamless transaction processing regardless of internet connectivity."}\`{
  "refined": "LogicHQ provides robust offline point-of-sale capabilities, ensuring uninterrupted business operations and seamless transaction processing regardless of internet connectivity."
}`;

const mockResponse2 = `{
  "refined": "LogicHQ is an AI-powered outbound outreach ecosystem designed to scale B2B lead generation through hyper-personalized communication and intelligent automation."
}`;

const mockResponse3 = `Here is your refined text:
{ "refined": "Out outreach system." }
Hope you like it!`;

console.log("Mock 1 result:", parseRefined(mockResponse1));
console.log("Mock 2 result:", parseRefined(mockResponse2));
console.log("Mock 3 result:", parseRefined(mockResponse3));
