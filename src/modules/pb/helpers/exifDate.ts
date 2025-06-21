export function fromExifDate(exifDate: string): { date: Date; year: string; month: string; day: string } {
    const parts = exifDate.split(' ');
    const datePart = parts[0].replaceAll(':', '-');
    const datePartSplitted = datePart.split('-');

    return {
        date: new Date(`${datePart} ${parts.length > 0 ? parts[1] : ''}`),
        year: datePartSplitted[0],
        month: datePartSplitted[1],
        day: datePartSplitted[2],
    };
}
