import { ImageFileTypeType } from "src/types/imageFileTypes.ts";

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
