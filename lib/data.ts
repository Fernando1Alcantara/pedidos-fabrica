import { formatInTimeZone }
from 'date-fns-tz'

export function formatarData(
  data: string
) {

  const dataUtc =
    data.endsWith('Z')
      ? data
      : data + 'Z'

  return formatInTimeZone(

    dataUtc,

    'America/Sao_Paulo',

    'dd/MM/yyyy HH:mm:ss'

  )

}