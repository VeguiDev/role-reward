export function isValidUrl(url:string) {

    try {
        return Boolean(new URL(url));
    } catch {
        return false;
    }

}

export function IncludeAll(source:any[], target:any[]) {

    for(let requirement of source) {
        
        if(!target.includes(requirement)) return false;

    }

    return true;

}