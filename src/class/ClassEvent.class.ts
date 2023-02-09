
export type EventCallback = (...values:any) => any;

export default class ClassEvents<T> {

    private eventsHandlers:EventHandler[] = [];

    emit(event:T extends string ? T : never, ...values:any) {

        this.eventsHandlers.filter(e => e.event_name == event).forEach(event => {
            event.handle(...values);
        });

    }

    addEventListener(event:T extends string ? T : never, cb:EventCallback) {
        return this.on(event, cb);
    }

    on(event:T extends string ? T : never, cb:EventCallback) {

        return this.eventsHandlers.push(new EventHandler(event, cb));

    }

    removeEventListener(id:number) {

        this.eventsHandlers.splice(id, 1);

    }

}

export class EventHandler {

    event_name:string;
    event_callback:EventCallback;

    constructor(event_name:string, cb:EventCallback) {
        this.event_callback = cb;
        this.event_name = event_name;
    }

    handle(...values:any) {

        this.event_callback(...values);

    }

}