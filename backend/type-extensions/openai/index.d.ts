import { ImageFileTypeType } from "src/utils/imageFileTypes.ts";

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
