import { environment } from '../../environments/environment';

export const Server = {
    endpoint : environment.APP_ENDPOINT,
    apiEndpoint : environment.API_ENDPOINT,
    project: environment.APP_PROJECT,
    collectionID : environment.APP_COLLECTION_ID
}
