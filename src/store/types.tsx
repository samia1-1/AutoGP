export interface UserState {
  username: string | null;
}

export interface AppState {
  user: UserState;
}
