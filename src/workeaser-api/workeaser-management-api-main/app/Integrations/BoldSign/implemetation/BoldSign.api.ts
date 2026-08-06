import Env from '@ioc:Adonis/Core/Env';
import axios from 'axios';

const BoldSignAPI = axios.create({
  baseURL: Env.get('BOLD_SIGN_API'),
  headers: {
    'accept': 'application/json',
    'X-API-KEY': Env.get('BOLD_SIGN_API_KEY')
  }
});

export default BoldSignAPI;
