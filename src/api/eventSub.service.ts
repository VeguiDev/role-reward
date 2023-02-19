import { HelixApiClient as apiClient } from "./helixApiClient";
import { ResponseWrapper } from "./lib/ResponseWreapper.lib";

export async function EventSubSubscribe(event:string, session_id:string) {

    return await ResponseWrapper(
        apiClient({
            url: "eventsub/subscriptions",
            method: "POST",
            data: {
                type: event,
                version: 1,
                condition: {
                    broadcaster_user_id: "::USER_ID::"
                },
                transport: {
                    method: "websocket",
                    session_id: session_id
                }
            }
        })
    )

}

export async function EventSubUnsubscribe(subscription_id:string) {

    return await ResponseWrapper(
        apiClient({
            url: "eventsub/subscriptions",
            method: "DELETE",
            params: {
                id: subscription_id
            }
        })
    )

}