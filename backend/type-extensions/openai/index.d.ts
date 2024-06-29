import { ImageFileTypeType } from '../../types/imageFileTypes.ts';

declare module 'openai' {
  namespace OpenAI {
    namespace Images {
      interface Image {
        fileName?: string;
        fileType?: ImageFileTypeType;
      }
    }
  }
}
