import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { Configuration, OpenAIApi } from "openai";
import { env } from "~/env.mjs"
import { b64Image } from "~/data/b64Image";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: env.ACCESS_KEY_ID,
    secretAccessKey: env.SECRET_ACCESS_KEY,
  },
  region: "us-west-1"
})

const configuration = new Configuration({
    apiKey: env.DALLE_API_KEY,
})

const openai = new OpenAIApi(configuration);

async function generateIcon(prompt: string): Promise<string | undefined> {
    if (env.MOCK_DALLE === "true"){
        return b64Image;
    } else {
        const response = await openai.createImage({
            prompt,
            n: 1,
            size: "1024x1024",
            response_format: "b64_json",
        })
        console.log("=====")
        console.log(response.data.data[0]?.b64_json)
        console.log("=====")
        return response.data.data[0]?.b64_json
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
        const base64EncodedImage = await generateIcon(input.prompt)
        // TODO: save the images to the s3 bucket
        await s3.putObject({
            Bucket: 'corporate-memphis-ai',
            Body: Buffer.from(base64EncodedImage!, "base64"),
            Key: "my-image2.png", // #TODO: generate random id
            ContentEncoding: "base64",
            ContentType: "image/png",
        }).promise();

        return{
            imageUrl: base64EncodedImage,
        }
    }),
});
