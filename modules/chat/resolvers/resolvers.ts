import { PubSub, withFilter } from 'apollo-server-express';
import { Chat } from '../../../entity/Chat';
import { IResolvers } from '../../../types';
import { ChatProvider } from '../providers/chat.provider';

export default {
  Query: {
    chats: (obj, args, { injector }) => injector.get(ChatProvider).getChats(),
    chat: (obj, { chatId }, { injector }) => injector.get(ChatProvider).getChat(chatId),
  },
  Mutation: {
    addChat: (obj, { userId }, { injector }) => injector.get(ChatProvider).addChat(userId),
    addGroup: (obj, { userIds, groupName, groupPicture }, { injector }) =>
      injector.get(ChatProvider).addGroup(userIds, {
        groupName: groupName || '',
        groupPicture: groupPicture || '',
      }),
    updateChat: (obj, { chatId, name, picture }, { injector }) => injector.get(ChatProvider).updateChat(chatId, {
      name: name || '',
      picture: picture || '',
    }),
    removeChat: (obj, { chatId }, { injector }) => injector.get(ChatProvider).removeChat(chatId),
    updateUser: (obj, { name, picture }, { injector }) => injector.get(ChatProvider).updateUser({
      name: name || '',
      picture: picture || '',
    }),
  },
  Subscription: {
    chatAdded: {
      subscribe: withFilter((root, args, { injector }) => injector.get(PubSub).asyncIterator('chatAdded'),
        ({ chatAdded, creatorId }: { chatAdded: Chat, creatorId: number }, variables, { injector }) =>
          injector.get(ChatProvider).filterChatAddedOrUpdated(chatAdded, creatorId)
      ),
    },
    chatUpdated: {
      subscribe: withFilter((root, args, { injector }) => injector.get(PubSub).asyncIterator('chatUpdated'),
        ({ chatUpdated, updaterId }: { chatUpdated: Chat, updaterId: number }, variables, { injector }) =>
          injector.get(ChatProvider).filterChatAddedOrUpdated(chatUpdated, updaterId)
      ),
    },
  },
  Chat: {
    name: (chat, args, { injector }) => injector.get(ChatProvider).getChatName(chat),
    picture: (chat, args, { injector }) => injector.get(ChatProvider).getChatPicture(chat),
    allTimeMembers: (chat, args, { injector }) => injector.get(ChatProvider).getChatAllTimeMembers(chat),
    listingMembers: (chat, args, { injector }) => injector.get(ChatProvider).getChatListingMembers(chat),
    actualGroupMembers: (chat, args, { injector }) => injector.get(ChatProvider).getChatActualGroupMembers(chat),
    admins: (chat, args, { injector }) => injector.get(ChatProvider).getChatAdmins(chat),
    owner: (chat, args, { injector }) => injector.get(ChatProvider).getChatOwner(chat),
    isGroup: (chat, args, { injector }) => injector.get(ChatProvider).isChatGroup(chat),
  },
} as IResolvers;