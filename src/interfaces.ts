export interface WakatimeItem {
  grand_total: {
    digital: string;
    hours: number;
    minutes: number;
    text: string;
    total_seconds: number;
  };
}

export interface WakatimeData {
  data: WakatimeItem[];
}
