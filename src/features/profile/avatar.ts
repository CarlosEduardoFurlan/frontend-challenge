const MAX_SIZE = 256

/**
 * Reads an image file and returns a square 256px WebP data URL. Resizing on the client keeps
 * the stored avatar small (well under the 300 KB API limit) regardless of the original file.
 */
export async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Selecione um arquivo de imagem.')
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = MAX_SIZE
  canvas.height = MAX_SIZE
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Não foi possível processar a imagem.')
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    MAX_SIZE,
    MAX_SIZE,
  )
  bitmap.close()
  return canvas.toDataURL('image/webp', 0.85)
}
