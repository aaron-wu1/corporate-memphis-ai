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
  region: "us-west-2"
})

const BUCKET_NAME = 'corporate-memphis-ai'

const configuration = new Configuration({
    apiKey: env.DALLE_API_KEY,
})

const openai = new OpenAIApi(configuration);

/** Generate images
 *  Takes prompt and returns base 64 encoded, json formatted image */ 
async function generateImage(prompt: string): Promise<string | undefined> {
    if (env.MOCK_DALLE === "true"){
        return b64Image;
    } else {
        const response = await openai.createImage({
            prompt,
            n: 1,
            size: "1024x1024",
            response_format: "b64_json",
        })
        return response.data.data[0]?.b64_json
    }
}

/** Checks db if user has enough credits, and perform api reqs
 *  Mutates prisma db, zod validates request */ 
export const generateRouter = createTRPCRouter({
    generateImage: protectedProcedure
    .input(
        z.object({
            prompt: z.string(),
        })
    )
    .mutation(async ({ ctx, input }) => {
        const {count} = await ctx.prisma.user.updateMany({
            where: {
                id: ctx.session.user.id,
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
        // catch if out of credits
        if (count <= 0) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'you are out of credits'
            })
        }

        // Make fetch req to dalle API
        const base64EncodedImage = await generateImage(input.prompt)

        // defines image model
        const image = await ctx.prisma.image.create({
            data:{
                prompt: input.prompt,
                userId: ctx.session.user.id,
            }
        })

        // saves images into s3 bucket
        await s3.putObject({
            Bucket: BUCKET_NAME,
            Body: Buffer.from(base64EncodedImage!, "base64"),
            Key: image.id,
            ContentEncoding: "base64",
            ContentType: "image/png",
        }).promise();

        // s3 static site hosting images
        return{
            imageUrl: `https://${BUCKET_NAME}.s3.us-west-2.amazonaws.com/${image.id}`,
        }
    }),
});
