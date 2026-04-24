// Catálogo de ediciones de la Revista Conozca en PDF
// Servidos por Nginx en /revistas/pdfs/<filename>
// Generado desde backup original: homedir/public_html/PDF/

export interface RevistaPDF {
    filename: string
    year: number
    label: string
    url: string
}

const BASE_URL = '/revistas/pdfs'

// Ediciones limpias y deduplicadas
const RAW: { filename: string; year: number; label: string }[] = [
    // 1961
    { filename: '1961.El Instituto No.1.pdf',   year: 1961, label: 'El Instituto No. 1' },
    { filename: '1961.El Instituto No.2.pdf',   year: 1961, label: 'El Instituto No. 2' },
    // 1962
    { filename: '1962 El Instituto No.3.pdf',   year: 1962, label: 'El Instituto No. 3' },
    // 1964
    { filename: '1964.El Instituto No.9.pdf',   year: 1964, label: 'El Instituto No. 9' },
    // 1965
    { filename: '1965.El Instituto No.11.pdf',  year: 1965, label: 'El Instituto No. 11' },
    // 1966
    { filename: '1966 El Instituto No.13.pdf',  year: 1966, label: 'El Instituto No. 13' },
    { filename: '1966. El Instituto No. 14.pdf',year: 1966, label: 'El Instituto No. 14' },
    // 1967
    { filename: '1967.El Instituto No.17.pdf',  year: 1967, label: 'El Instituto No. 17' },
    // 1971
    { filename: '1971. Vol1, No.1.pdf',         year: 1971, label: 'Vol. 1, No. 1' },
    { filename: '1971. Vol. 1, No.2.pdf',       year: 1971, label: 'Vol. 1, No. 2' },
    // 1972
    { filename: '1972. Vol.1 No.2.pdf',         year: 1972, label: 'Vol. 1, No. 2' },
    // 1976
    { filename: '1976 Vol 2, No.2.pdf',         year: 1976, label: 'Vol. 2, No. 2' },
    { filename: '1976.Vol.2, No.3.pdf',         year: 1976, label: 'Vol. 2, No. 3' },
    { filename: '1976.Vol.2, No.4.pdf',         year: 1976, label: 'Vol. 2, No. 4' },
    // 1977
    { filename: '1977.1.pdf', year: 1977, label: 'Edición 1' },
    { filename: '1977.2.pdf', year: 1977, label: 'Edición 2' },
    { filename: '1977.3.pdf', year: 1977, label: 'Edición 3' },
    { filename: '1977.4.pdf', year: 1977, label: 'Edición 4' },
    // 1978
    { filename: '1978.1.pdf', year: 1978, label: 'Edición 1' },
    { filename: '1978.2.pdf', year: 1978, label: 'Edición 2' },
    { filename: '1978.4.pdf', year: 1978, label: 'Edición 4' },
    // 1979
    { filename: '1979.1.pdf', year: 1979, label: 'Edición 1' },
    { filename: '1979.2.pdf', year: 1979, label: 'Edición 2' },
    { filename: '1979.3.pdf', year: 1979, label: 'Edición 3' },
    // 1980
    { filename: '1980.1.pdf', year: 1980, label: 'Edición 1' },
    { filename: '1980.2.pdf', year: 1980, label: 'Edición 2' },
    { filename: '1980.3.pdf', year: 1980, label: 'Edición 3' },
    { filename: '1980.4.pdf', year: 1980, label: 'Edición 4' },
    // 1981
    { filename: '1981.2.pdf', year: 1981, label: 'Edición 2' },
    { filename: '1981.3.pdf', year: 1981, label: 'Edición 3' },
    { filename: '1981.4.pdf', year: 1981, label: 'Edición 4' },
    // 1982
    { filename: '1982.1.pdf', year: 1982, label: 'Edición 1' },
    { filename: '1982.2.pdf', year: 1982, label: 'Edición 2' },
    { filename: '1982.3.pdf', year: 1982, label: 'Edición 3' },
    { filename: '1982.4.pdf', year: 1982, label: 'Edición 4' },
    // 1983
    { filename: '1983.1.pdf', year: 1983, label: 'Edición 1' },
    { filename: '1983.2.pdf', year: 1983, label: 'Edición 2' },
    // 1984
    { filename: '1984.1.pdf', year: 1984, label: 'Edición 1' },
    // 1985
    { filename: '1985.2.pdf', year: 1985, label: 'Edición 2' },
    // 1986
    { filename: '1986.1.pdf', year: 1986, label: 'Edición 1' },
    { filename: '1986.2.pdf', year: 1986, label: 'Edición 2' },
    // 1987
    { filename: '1987.3.pdf', year: 1987, label: 'Edición 3' },
    // 1988
    { filename: '1988.2.pdf', year: 1988, label: 'Edición 2' },
    // 1989
    { filename: '1989.1.pdf', year: 1989, label: 'Edición 1' },
    // 1991
    { filename: '1991.1.pdf', year: 1991, label: 'Edición 1' },
    { filename: '1991.2.pdf', year: 1991, label: 'Edición 2' },
    { filename: '1991.4.pdf', year: 1991, label: 'Edición 4' },
    // 1993
    { filename: '1993.2.pdf', year: 1993, label: 'Edición 2' },
    // 1996
    { filename: '1996.1.pdf', year: 1996, label: 'Edición 1' },
    { filename: '1996.2.pdf', year: 1996, label: 'Edición 2' },
    // 1997
    { filename: '1997.3.pdf', year: 1997, label: 'Edición 3' },
    // 1998
    { filename: '1998.1.pdf', year: 1998, label: 'Edición 1' },
    { filename: '1998.2.pdf', year: 1998, label: 'Edición 2' },
    { filename: '1998.3.pdf', year: 1998, label: 'Edición 3' },
    { filename: '1998.4.pdf', year: 1998, label: 'Edición 4' },
    // 1999
    { filename: '1999.2.pdf', year: 1999, label: 'Edición 2' },
    { filename: '1999.3.pdf', year: 1999, label: 'Edición 3' },
    // 2000
    { filename: '2000.3.pdf', year: 2000, label: 'Edición 3' },
    // 2001
    { filename: '2001.1.pdf', year: 2001, label: 'Edición 1' },
    // 2002
    { filename: '2002.2.pdf', year: 2002, label: 'Edición 2' },
]

export const REVISTAS: RevistaPDF[] = RAW.map(r => ({
    ...r,
    url: `${BASE_URL}/${encodeURIComponent(r.filename)}`,
}))

// Grouped by year (oldest first)
export const REVISTAS_BY_YEAR: { year: number; editions: RevistaPDF[] }[] = (() => {
    const map = new Map<number, RevistaPDF[]>()
    for (const r of REVISTAS) {
        if (!map.has(r.year)) map.set(r.year, [])
        map.get(r.year)!.push(r)
    }
    return Array.from(map.entries())
        .sort(([a], [b]) => a - b)
        .map(([year, editions]) => ({ year, editions }))
})()
