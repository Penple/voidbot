export async function getImages(): Promise<{ [id: string]: string }> {
  let manifest = await (
    await fetch('https://void.penple.dev/manifest.json')
  ).json()
  return manifest as any
}
