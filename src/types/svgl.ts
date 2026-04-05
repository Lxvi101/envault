export interface SvglIcon {
  id: number;
  title: string;
  category: string;
  route: string | SvglThemeRoute;
  url: string;
}

export interface SvglThemeRoute {
  light: string;
  dark: string;
}

export interface SvglSearchResponse extends Array<SvglIcon> {}

export interface CachedSvglEntry {
  svg: string;
  fetchedAt: number;
}
