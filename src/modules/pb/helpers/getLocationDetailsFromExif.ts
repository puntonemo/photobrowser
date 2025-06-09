export interface LocationDetailsDto {
    label: string;
    countryCode: string;
    countryName: string;
    state?: string;
    county?: string;
    city?: string;
    district?: string;
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    latitude: number;
    longitude: number;
    categories: string[];
}

const normalize = (text?: string): string | undefined => {
    return text
        ?.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
};

const parseDMS = (dms: string): number => {
    const match = dms.match(/(\d+)\D+(\d+)\D+([\d.]+)\D+([NSEW])/i);
    if (!match) throw new Error(`Formato GPS inválido: ${dms}`);
    const [, deg, min, sec, ref] = match;
    let decimal = +deg + +min / 60 + +sec / 3600;
    if (ref.toUpperCase() === 'S' || ref.toUpperCase() === 'W') decimal *= -1;
    return decimal;
};

export async function getLocationDetailsFromExif(metadata: any): Promise<LocationDetailsDto | undefined> {
    const hereApiKey = process.env.HERE_API_KEY;

    let latitude: number;
    let longitude: number;

    if (metadata.GPSLatitude && metadata.GPSLongitude && metadata.GPSLatitudeRef && metadata.GPSLongitudeRef) {
        const extract = (dms: string, ref: string) => {
            const [deg, min, sec] = dms.match(/\d+(\.\d+)?/g)!.map(Number);
            let decimal = deg + min / 60 + sec / 3600;
            if (ref === 'S' || ref === 'W') decimal *= -1;
            return decimal;
        };
        latitude = extract(metadata.GPSLatitude, metadata.GPSLatitudeRef);
        longitude = extract(metadata.GPSLongitude, metadata.GPSLongitudeRef);
    } else if (metadata.GPSPosition) {
        const [latStr, lonStr] = metadata.GPSPosition.split(',').map((s) => s.trim());
        latitude = parseDMS(latStr);
        longitude = parseDMS(lonStr);
    } else {
        return undefined;
    }

    const url = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&lang=es-ES&apiKey=${hereApiKey}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error en la petición a HERE API: ${res.status} ${res.statusText}`);

    const data = await res.json();
    if (!data.items || data.items.length === 0) {
        return undefined;
    }

    const addr = data.items[0].address;
    const categories = data.items[0].categories ? data.items[0].categories.map((i) => i.name) : [];

    return {
        label: normalize(addr.label)!,
        countryCode: addr.countryCode!,
        countryName: normalize(addr.countryName)!,
        state: normalize(addr.state),
        county: normalize(addr.county),
        city: normalize(addr.city),
        district: normalize(addr.district),
        street: normalize(addr.street),
        houseNumber: addr.houseNumber,
        postalCode: addr.postalCode,
        latitude,
        longitude,
        categories,
    };
}
