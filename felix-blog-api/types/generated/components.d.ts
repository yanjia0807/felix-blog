import type { Schema, Struct } from '@strapi/strapi';

export interface SharedAttachment extends Struct.ComponentSchema {
  collectionName: 'components_shared_attachments';
  info: {
    description: '';
    displayName: 'attachment';
  };
  attributes: {
    files: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    type: Schema.Attribute.Enumeration<['image', 'video', 'audio', 'file']>;
  };
}

export interface SharedDistrict extends Struct.ComponentSchema {
  collectionName: 'components_shared_districts';
  info: {
    displayName: ' District';
    icon: 'pinMap';
  };
  attributes: {
    cityCode: Schema.Attribute.String;
    cityName: Schema.Attribute.String;
    districtCode: Schema.Attribute.String;
    districtName: Schema.Attribute.String;
    provinceCode: Schema.Attribute.String;
    provinceName: Schema.Attribute.String;
  };
}

export interface SharedPoi extends Struct.ComponentSchema {
  collectionName: 'components_shared_pois';
  info: {
    description: '';
    displayName: 'Poi';
    icon: 'pinMap';
  };
  attributes: {
    adcode: Schema.Attribute.String;
    address: Schema.Attribute.String;
    adname: Schema.Attribute.String;
    citycode: Schema.Attribute.String;
    cityname: Schema.Attribute.String;
    location: Schema.Attribute.String;
    name: Schema.Attribute.String;
    pcode: Schema.Attribute.String;
    pname: Schema.Attribute.String;
    type: Schema.Attribute.String;
    typecode: Schema.Attribute.String;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.attachment': SharedAttachment;
      'shared.district': SharedDistrict;
      'shared.poi': SharedPoi;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
    }
  }
}
