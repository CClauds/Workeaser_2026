import Database from '@ioc:Adonis/Lucid/Database';
import Chat from 'App/Models/Chat';
import ChatMessage, { SentByEnum } from 'App/Models/ChatMessage';
import ClientAccount from 'App/Models/ClientAccount';
import CoworkClient from 'App/Models/CoworkClient';
import User from 'App/Models/User';
import AppError from 'App/Utils/AppError';

interface ChatMessageData {
  from_user_id?: number;
  message: string;
  chat_uuid: string;
  chat_id?: number;
}

interface ChatData {
  client_account_id: number;
}

export default class ChatService {
  static async listChats(user: User) {
    await user.load('coworkUser');

    if (!user.coworkUser) {
      throw new AppError(AppError.BAD_REQUEST, 'Invalid cowork user');
    }

    let chats = await Chat.query()
      .preload('clientAccount', (ca) => {
        ca.select('company_name', 'company_photo_id', 'user_id');
        ca.preload('companyPhoto', (p) => {
          p.select('file');
        });
        ca.preload('user', (u) => {
          u.select('uuid');
        });
      })
      .preload('coworkAccount', (ca) => {
        ca.select('name', 'photo_id');
        ca.preload('photo', (p) => {
          p.select('file');
        });
      })
      .where('cowork_account_id', user.coworkUser.coworkAccountId);

    return chats;
  }

  static async newMessage(user: User, data: ChatMessageData) {
    await user.load('coworkUser');

    if (!user.coworkUser) {
      throw new AppError(AppError.BAD_REQUEST, 'Invalid cowork user');
    }

    const chat = await Chat.query()
      .where('uuid', data.chat_uuid)
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .first();

    if (!chat) {
      throw new AppError(AppError.NOT_FOUND, 'Invalid chat');
    }

    const newMessageData = {
      fromUserId: user.id,
      message: data.message,
      chatId: chat.id,
      sentBy: SentByEnum.COWORK
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
    await user.load('coworkUser');

    if (!user.coworkUser) {
      throw new AppError(AppError.BAD_REQUEST, 'Invalid cowork user');
    }

    const clientAccount = await ClientAccount.findOrFail(data.client_account_id);

    const isClient = await CoworkClient.query()
      .where('cowork_account_id', user.coworkUser.coworkAccountId)
      .where('user_id', clientAccount.userId)
      .first();

    if (!isClient) {
      throw new AppError(AppError.NOT_FOUND, 'Client User not found');
    }

    const newChatData = {
      coworkAccountId: user.coworkUser.coworkAccountId,
      clientAccountId: data.client_account_id
    };

    const trx = await Database.transaction();

    const chat = await Chat.firstOrCreate(newChatData, newChatData, { client: trx });

    await trx.commit();

    return chat;
  }

  static async lastMessages(user: User) {
    await user.load('coworkUser');
    const chats = await Chat.query()
      .select('id')
      .where('cowork_account_id', user.coworkUser.coworkAccountId);

    const messages = await ChatMessage.query()
      .whereIn(
        'chat_id',
        chats.map((chat) => chat.id)
      )
      .where('sent_by', SentByEnum.CLIENT)
      .preload('chat', (c) => {
        c.preload('clientAccount', (ca) => {
          ca.select('company_name', 'company_photo_id');
          ca.preload('companyPhoto', (cp) => {
            cp.select('file');
          });
        });
        c.select('uuid', 'clientAccountId');
      })
      .orderBy('created_at')
      .limit(10);

    return messages.map((message) => message.serialize());
  }

  static async showChatMessages(user: User, uuid: string) {
    await user.load('coworkUser');

    const chat = await Chat.query()
      .where('uuid', uuid)
      .where('cowork_account_id', user?.coworkUser?.coworkAccountId)
      .preload('messages')
      .first();

    if (!chat) {
      throw new AppError(AppError.NOT_FOUND, 'Chat not found');
    }

    return chat.messages;
  }
}
