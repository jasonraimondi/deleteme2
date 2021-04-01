import { BehaviorSubject } from "rxjs";
import { NotifyMessage } from "./use_notify";

export enum NotifyType {
  Error = "error",
  Info = "info",
  Success = "success",
}

export type Notify = {
  id: number;
  message: string;
  title?: string;
  type: NotifyType;
  isSuccess: boolean;
  isInfo: boolean;
  isError: boolean;
}

export type NotifyList = Record<number, Notify>;

export type NotifySettings = {
  ttl: number;
};

export class NotifyService {
  private settings: NotifySettings = { ttl: 4500 };

  private readonly CLEAR_STATE = {};

  public readonly messageList$ = new BehaviorSubject<NotifyList>(this.CLEAR_STATE);

  setOptions(customSettings: Partial<NotifySettings>) {
    this.settings = { ...this.settings, ...customSettings };
  }

  success(message: string | NotifyMessage) {
    this.flash(message, NotifyType.Success);
  }

  info(message: string | NotifyMessage) {
    this.flash(message, NotifyType.Info);
  }

  error(message: string | NotifyMessage) {
    this.flash(message, NotifyType.Error);
  }

  clear(id?: number) {
    if (id) {
      this.remove(id);
    } else {
      this.messageList$.next(this.CLEAR_STATE);
    }
  }

  private remove(id: number): void {
    const existing = this.messageList$.value;
    if (existing.hasOwnProperty(id)) {
      delete existing[id];
      this.messageList$.next(existing);
    }
  }

  private flash(message: string | NotifyMessage, type: NotifyType = NotifyType.Info): void {
    const id = Date.now();
    let title: string | undefined;
    let ttl = this.settings.ttl;

    if (typeof message !== "string") {
      title = message.title;
      ttl = message.ttl ?? ttl;
      message = message.message;
    }

    this.addMessageToList({
      id,
      message,
      title,
      type,
      isSuccess: type === NotifyType.Success,
      isInfo: type === NotifyType.Info,
      isError: type === NotifyType.Error,
    });
    setTimeout(() => this.remove(id), ttl);
  }

  private addMessageToList(message: Notify): void {
    const messageList = {
      ...this.messageList$.value,
      [message.id]: message,
    };
    this.messageList$.next(messageList);
  }
}

export const notifyService = new NotifyService();
