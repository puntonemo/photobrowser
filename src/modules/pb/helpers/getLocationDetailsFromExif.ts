export interface LocationDetailsDto {
    status: 'success';
    status_message: string;
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
    rawResponse: any;
}

export interface LocationErrorDto {
    status: 'error';
    status_message: string;
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

const extract = (dms: string, ref: string) => {
    const [deg, min, sec] = dms.match(/\d+(\.\d+)?/g)!.map(Number);
    let decimal = deg + min / 60 + sec / 3600;
    const dir = ref.trim().charAt(0).toUpperCase(); // N, S, E, W
    if (dir === 'S' || dir === 'W') decimal *= -1;
    return decimal;
};

export async function getLocationDetailsFromExif(metadata: any): Promise<LocationDetailsDto | LocationErrorDto> {
    const hereApiKey = process.env.HERE_API_KEY;

    let latitude: number;
    let longitude: number;

    if (metadata.GPSLatitude && metadata.GPSLongitude && metadata.GPSLatitudeRef && metadata.GPSLongitudeRef) {
        latitude = extract(metadata.GPSLatitude, metadata.GPSLatitudeRef);
        longitude = extract(metadata.GPSLongitude, metadata.GPSLongitudeRef);
    } else if (metadata.GPSPosition) {
        const [latStr, lonStr] = metadata.GPSPosition.split(',').map((s) => s.trim());
        latitude = parseDMS(latStr);
        longitude = parseDMS(lonStr);
    } else {
        return {
            status: 'error',
            status_message: 'Unable to get latitude/longitude',
        };
    }
    console.log('latitude', latitude);
    console.log('longitude', longitude);
    const url = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&lang=es-ES&apiKey=${hereApiKey}`;
    console.log(url);
    const res = await fetch(url);
    if (!res.ok) {
        return {
            status: 'error',
            status_message: `${res.status} ${res.statusText}`,
        };
    }

    const data = await res.json();
    if (!data.items || data.items.length === 0) {
        return {
            status: 'error',
            status_message: 'Empty response',
        };
    }

    const addr = data.items[0].address;
    const categories = data.items[0].categories ? data.items[0].categories.map((i) => i.name) : [];

    return {
        status: 'success',
        status_message: 'success',
        label: addr.label!,
        countryCode: addr.countryCode!,
        countryName: addr.countryName!,
        state: addr.state,
        county: addr.county,
        city: addr.city,
        district: addr.district,
        street: addr.street,
        houseNumber: addr.houseNumber,
        postalCode: addr.postalCode,
        latitude,
        longitude,
        categories,
        rawResponse: data,
    };
}
