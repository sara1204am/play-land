export interface ZnCoreTableTags {
  tailwindClass: string;
  value: string | number | boolean;
}

export type Zn45TableColumnI =
  | {
      type: 'text';
      key: string;
      header: string;
      hidden: boolean;
      sortable?: boolean;
      filterable?: boolean;
      globalSearch?: boolean;
      hideOnSmallScreen?: boolean;
    }
  | {
      type: 'number';
      key: string;
      header: string;
      hidden: boolean;
      sortable?: boolean;
      filterable?: boolean;
      globalSearch?: boolean;
      prefix?: string;
      suffix?: string;
      format?: string;
      hideOnSmallScreen?: boolean;
    }
  | {
      type: 'date';
      key: string;
      header: string;
      hidden: boolean;
      sortable?: boolean;
      globalSearch?: boolean;
      filterable?: boolean;
      format?: string;
      hideOnSmallScreen?: boolean;
    }
  | {
      type: 'select';
      key: string;
      header: string;
      hidden: boolean;
      globalSearch?: boolean;
      filterable?: boolean;
      catalogCode: string;
      sortable?: boolean;
      tagMap?: ZnCoreTableTags[];
      hideOnSmallScreen?: boolean;
    }
  | {
      type: 'multi-select';
      key: string;
      header: string;
      hidden: boolean;
      globalSearch?: false;
      filterable?: boolean;
      catalogCode: string;
      hideOnSmallScreen?: boolean;
    }
  | {
      type: 'img';
      key: string;
      header: string;
      hidden: boolean;
      globalSearch?: false;
      hideOnSmallScreen?: boolean;
    };
