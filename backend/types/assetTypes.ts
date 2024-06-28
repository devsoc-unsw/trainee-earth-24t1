import createId from '@backend/utils/createId.js';
import { toIsoStringWithTimezone } from '@backend/utils/date.js';
import {
  JSONCompatible,
  JSONObject,
  Serializable,
} from '@backend/utils/objectTyping.js';

/**
 * Number of tiles that the asset occupies physically on the map.
 */
type Dimensions = {
  dx: number; // x-axis
  dy: number; // y-axis
};

export type AssetId = string;

export type AssetsJSON = { [key: AssetId]: AssetJSON };
export type Assets = Map<AssetId, Asset>;

// Note: Use serializeMapToJSON and deserializeJSONToMap from objectTyping.js

export interface AssetJSON extends JSONObject {
  _id: AssetId;
  name: string;
  date: string;
  description: string;
  type: string;
  remoteImages: RemoteImageJSON[];
  dimensions: Dimensions;
}

export class Asset implements Serializable<AssetJSON> {
  public readonly _id: AssetId;
  public name: string;
  public type: string;
  public description: string;
  public readonly date: Date;
  // Array of URLs to image in object storage, in order of processing
  // First image is the original image generated by OpenAI
  // Last image is the final image after all
  public readonly remoteImages: RemoteImage[];
  public dimensions: Dimensions;

  constructor(
    description: string,
    name: string,
    type: string,
    date: Date = new Date(),
    id: AssetId = createId(),
    remoteImages: RemoteImage[] = [],
    dimensions: Dimensions = { dx: 0, dy: 0 }
  ) {
    this.description = description;
    this.type = type;
    this.date = date;
    this._id = id;
    this.remoteImages = remoteImages;
    this.dimensions = dimensions;
    this.name = name ?? this._id;
  }

  getFilename(): string {
    return `${this.name}.${this.type}`;
  }

  addRemoteImage(remoteObject: RemoteImage) {
    this.remoteImages.push(remoteObject);
  }

  getRemoteImages(): RemoteImage[] {
    return this.remoteImages;
  }

  getDimensions(): Dimensions {
    return this.dimensions;
  }

  setDimensions(dimensions: Dimensions): void {
    this.dimensions = dimensions;
  }

  serialize(): JSONCompatible<AssetJSON> {
    return {
      description: this.description,
      name: this.name,
      type: this.type,
      date: toIsoStringWithTimezone(this.date),
      _id: this._id,
      remoteImages: this.remoteImages.map((remoteImage) =>
        remoteImage.serialize()
      ),
      dimensions: this.dimensions,
    };
  }

  static deserialize(obj: JSONCompatible<AssetJSON>): Asset {
    return new Asset(
      obj.description,
      obj.name,
      obj.type,
      new Date(obj.date),
      obj._id,
      obj.remoteImages.map((remoteImageObj) =>
        RemoteImage.deserialize(remoteImageObj)
      ),
      obj.dimensions
    );
  }
}

interface RemoteImageJSON extends JSONObject {
  name: string;
  url: string;
}
export class RemoteImage implements Serializable<RemoteImageJSON> {
  constructor(public name: string, public url: string) {}

  serialize(): JSONCompatible<RemoteImageJSON> {
    return {
      name: this.name,
      url: this.url,
    };
  }

  static deserialize(obj: JSONCompatible<RemoteImageJSON>): RemoteImage {
    return new RemoteImage(obj.name, obj.url);
  }
}
