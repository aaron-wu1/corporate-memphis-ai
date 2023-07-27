import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { Configuration, OpenAIApi } from "openai";
import { env } from "~/env.mjs"
const configuration = new Configuration({
    apiKey: env.DALLE_API_KEY,
})
const openai = new OpenAIApi(configuration);

async function generateIcon(prompt: string): Promise<string | undefined> {
    if (env.MOCK_DALLE === "true"){
        return "https://cdn.britannica.com/38/111338-050-D23BE7C8/Stars-NGC-290-Hubble-Space-Telescope.jpg"
    } else {
        const response = await openai.createImage({
            prompt,
            n: 1,
            size: "1024x1024"
        })
        return response.data.data[0]?.url
    }
}

export const generateRouter = createTRPCRouter({
    generateIcon: protectedProcedure
    .input(
        z.object({
            prompt: z.string(),
        })
    )
    .mutation(async ({ ctx, input }) => {
        console.log("we are here", input.prompt);

        // TODO: verify the user has enough credits
        const {count} = await ctx.prisma.user.updateMany({
            where: {
                id: ctx.session.user.id, //TODO: replace with real id
                credits: {
                    gte: 1 // greater than or equal to 1
                },
            },
            data: {
                credits: {
                    decrement: 1,
                }
            }
        })
        
        if (count <= 0) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'you are out of credits'
            })
        }
        // Make fetch req to dalle API
        const url = await generateIcon(input.prompt)

        return{
            imageUrl: url,
        }
    }),
});
