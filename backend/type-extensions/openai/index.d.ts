import { ImageFileTypeType } from "@backend/types/imageFileTypes.ts";

declare module "openai" {
  namespace OpenAI {
    namespace Images {
      interface Image {
        fileName?: string;
        fileType?: ImageFileTypeType;
      }
    }
  }
}
