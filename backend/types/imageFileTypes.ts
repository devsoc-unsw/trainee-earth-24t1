const IMAGE_FILE_TYPES = [
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "bmp",
  "svg",
] as const;

export type ImageFileTypeType = (typeof IMAGE_FILE_TYPES)[number];

export function isImageFileTypeType(
  value: unknown
): value is ImageFileTypeType {
  return IMAGE_FILE_TYPES.includes(value as ImageFileTypeType);
}
