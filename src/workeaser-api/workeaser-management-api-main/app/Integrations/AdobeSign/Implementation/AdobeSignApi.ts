import Env from '@ioc:Adonis/Core/Env';
import axios from 'axios';

const AdobeSingApi = axios.create({
  baseURL: Env.get('ADOBE_SIGN_API'),
  headers: {
    'Authorization': `Bearer ${Env.get('AUTHORIZATION_ADOBE_SIGN')}`,
    'Cache-Control': 'no-cache, no-store'
    //'Pragma': 'no-cache',
  }
});

export default AdobeSingApi;
