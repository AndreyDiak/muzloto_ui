export interface TThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
}

export interface TTheme {
  colorScheme: 'light' | 'dark';
  themeParams: TThemeParams;
  backgroundColor: string;
  headerColor: string;
}
