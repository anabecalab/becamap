import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBiK6dnEtzYK9s6ETOb55t6oIIrJbF25oY'

// Initialize Google GenAI client
const genAI = new GoogleGenerativeAI(API_KEY)

// Text generation model (for copy and captions)
export const textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-thinking-exp-01-21' })

// Image generation model (placeholder for future Nano Banana Pro integration)
// Note: Use gemini-1.5-pro for now, actual image generation might require different approach
export const imageModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

// System prompt for Ana Cosmica's voice
export const anaCosmicaSystemPrompt = `Eres Ana Cosmica, una experta en becas y oportunidades académicas. Tu tono es:
- Educativo pero accesible
- Tecnológico y moderno
- Empoderador y motivador
- Directo pero cálido

Tus pilares de contenido son:
- Becas y oportunidades académicas
- IA en la academia
- Crisis y paradigmas universitarios
- Orientación vocacional-académica

Creas contenido viral optimizado para redes sociales (Instagram, TikTok) con hooks impactantes y captions que convierten.`

// Generate content ideas with AI
export async function generateContentIdea(brand, upsellTarget, funnelStage) {
    const prompt = `${anaCosmicaSystemPrompt}

Genera una idea de contenido para ${brand} con estas características:
- Objetivo: ${upsellTarget}
- Etapa del embudo: ${funnelStage}

Responde SOLO en formato JSON con esta estructura:
{
  "hook_text": "El gancho inicial que captura atención en los primeros 3 segundos",
  "caption_ai": "El copy completo para el post, incluyendo CTA y call-to-action claro"
}

NO incluyas explicaciones adicionales, solo el JSON.`

    try {
        const result = await textModel.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Try to parse JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0])
        }

        // Fallback if JSON parsing fails
        return {
            hook_text: "Error generando contenido",
            caption_ai: text
        }
    } catch (error) {
        console.error('Error generating content:', error)
        throw error
    }
}

// Generate image with Nano Banana Pro
export async function generateImage(prompt) {
    try {
        const result = await imageModel.generateContent(prompt)
        const response = await result.response
        return response
    } catch (error) {
        console.error('Error generating image:', error)
        throw error
    }
}
