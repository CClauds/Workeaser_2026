import { ResponseContract } from '@ioc:Adonis/Core/Response';

export async function CheckFile(response: ResponseContract, fromFile: string) {
  return response.download(fromFile, true, (error) => {
    if (error.code === 'ENOENT') {
      return ['File does not exists', 404];
    }
    return ['Cannot download file', 400];
  });
}

export function Sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export const ParseUUIDToSmall = (uuid: string) => {
  return `${uuid?.slice(0, 5) || '000'}`;
};
