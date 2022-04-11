import { verify } from './verify'
import {
  InteractionType,
  InteractionResponseType,
  APIInteractionResponse,
  RESTPostAPIChannelInviteJSONBody,
  APIInvite,
  ApplicationCommandOptionType,
  ChannelType,
  MessageFlags,
  APIApplicationCommandInteraction,
  InviteTargetType,
  RouteBases,
  Routes,
  ApplicationCommandType,
} from 'discord-api-types/v9'
import { APIPingInteraction } from 'discord-api-types/payloads/v9/_interactions/ping'
import { getImages } from './images'

export async function handleRequest(request: Request): Promise<Response> {
  if (
    !request.headers.get('X-Signature-Ed25519') ||
    !request.headers.get('X-Signature-Timestamp')
  )
    return Response.redirect('https://penple.dev')
  if (!(await verify(request))) return new Response('', { status: 401 })

  const interaction = (await request.json()) as
    | APIPingInteraction
    | APIApplicationCommandInteraction

  if (interaction.type === InteractionType.Ping)
    return respond({
      type: InteractionResponseType.Pong,
    })

  if (interaction.data.type !== ApplicationCommandType.ChatInput)
    return new Response()

  let images = await getImages()

  let imageIds = Object.keys(images)

  let imageId = imageIds[Math.floor(Math.random() * imageIds.length)]

  if (
    interaction.data.options &&
    interaction.data.options[0] &&
    interaction.data.options[0].type === ApplicationCommandOptionType.String
  ) {
    imageId = interaction.data.options[0].value
  }

  if (!images[imageId]) {
    return respond({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `"${imageId}" is not a valid Void identifier id.`,
        flags: MessageFlags.Ephemeral,
      },
    })
  }

  return respond({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      embeds: [
        {
          title: `Void Image #${imageId}`,
          image: {
            url: `https://void.penple.dev/${imageId}.jpg`,
          },
          footer: {
            text: images[imageId],
          },
        },
      ],
    },
  })
}

const respond = (response: APIInteractionResponse) =>
  new Response(JSON.stringify(response), {
    headers: { 'content-type': 'application/json' },
  })
