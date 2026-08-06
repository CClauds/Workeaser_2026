import Database from '@ioc:Adonis/Lucid/Database';
import Chat from 'App/Models/Chat';
import ChatMessage, { SentByEnum } from 'App/Models/ChatMessage';
import CoworkAccount from 'App/Models/CoworkAccount';
import CoworkClient from 'App/Models/CoworkClient';
import User from 'App/Models/User';
import AppError from 'App/Utils/AppError';

interface MessageData {
  message: string;
  chat_uuid: string;
}

interface ChatData {
  cowork_account_id: number;
}

export default class ChatService {
  static async listChats(user: User) {
    await user.load('clientAccount');

    if (!user.clientAccount) {
      throw new AppError(AppError.BAD_REQUEST, 'Invalid client user');
    }

    let chats = await Chat.query()
      .preload('clientAccount', (ca) => {
        ca.select('company_name', 'company_photo_id', 'user_id');
        ca.preload('user', (u) => {
          u.select('uuid');
        });
        ca.preload('companyPhoto', (p) => {
          p.select('file');
        });
      })
      .preload('coworkAccount', (ca) => {
        ca.select('name', 'photo_id');
        ca.preload('photo', (p) => {
          p.select('file');
        });
      })
      .where('client_account_id', user.clientAccount.id);

    return chats;
  }

  static async lastMessages(user: User) {
    await user.load('clientAccount');
    const chats = await Chat.query().select('id').where('client_account_id', user.clientAccount.id);

    const messages = await ChatMessage.query()
      .whereIn(
        'chat_id',
        chats.map((chat) => chat.id)
      )
      .where('sent_by', SentByEnum.COWORK)
      .preload('chat', (c) => {
        c.preload('coworkAccount', (ca) => {
          ca.select('name', 'photo_id');
          ca.preload('photo', (p) => {
            p.select('file');
          });
        });
      })
      .orderBy('created_at')
      .limit(10);

    return messages.map((message) => message.serialize());
  }

  static async newMessage(user: User, data: MessageData) {
    await user.load('clientAccount');

    if (!user.clientAccount) {
      throw new AppError(AppError.BAD_REQUEST, 'Invalid client user');
    }

    const chat = await Chat.query()
      .where('uuid', data.chat_uuid)
      .andWhere('client_account_id', user.clientAccount.id)
      .first();

    if (!chat) {
      throw new AppError(AppError.BAD_REQUEST, 'Invalid chat');
    }

    const newMessageData = {
      fromUserId: user.id,
      message: data.message,
      chatId: chat.id,
      sentBy: SentByEnum.CLIENT
    };

    const trx = await Database.transaction();

    try {
      const newMessage = await ChatMessage.create(newMessageData, {
        client: trx
      });

      await trx.commit();

      return newMessage;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async firstOrCreateChat(user: User, data: ChatData) {
    await user.load('clientAccount');

    if (!user.clientAccount) {
      throw new AppError(AppError.BAD_REQUEST, 'Invalid client user');
    }

    const coworkAccount = await CoworkAccount.findOrFail(data.cowork_account_id);

    const isClient = await CoworkClient.query()
      .where('cowork_account_id', coworkAccount.id)
      .where('user_id', user.id)
      .first();

    if (!isClient) {
      throw new AppError(AppError.BAD_REQUEST, 'Cowork User not found');
    }

    const newChatData = {
      coworkAccountId: data.cowork_account_id,
      clientAccountId: user.clientAccount.id
    };

    const trx = await Database.transaction();

    const chat = await Chat.firstOrCreate(newChatData, newChatData, { client: trx });

    await trx.commit();

    return chat;
  }

  static async showChatMessages(user: User, uuid: string) {
    await user.load('clientAccount');
    const chat = await Chat.query()
      .where('uuid', uuid)
      .where('client_account_id', user.clientAccount.id)
      .preload('messages')
      .first();

    if (!chat) {
      throw new AppError(AppError.NOT_FOUND, 'Chat not found');
    }

    return chat.messages;
  }
}
