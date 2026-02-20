import React, { useState } from 'react';
import { View } from 'react-native';
import NewsListScreen from './news/NewsListScreen';
import NewsDetailScreen from './news/NewsDetailScreen';
import CreateNewsScreen from './news/CreateNewsScreen';
import EditNewsScreen from './news/EditNewsScreen';
import MyPostsScreen from './news/MyPostsScreen';
import BottomNavBar from '../components/BottomNavBar';

type Screen = 'list' | 'detail' | 'create' | 'myposts' | 'edit';

export default function NewsModule() {
  const [screen, setScreen] = useState<Screen>('list');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<any>(null);

  const goToList = () => {
    setScreen('list');
    setDetailId(null);
    setEditItem(null);
  };

  const goToDetail = (id: string) => {
    setDetailId(id);
    setScreen('detail');
  };

  const goToCreate = () => setScreen('create');
  const goToMyPosts = () => setScreen('myposts');
  const goToEdit = (item: any) => {
    setEditItem(item);
    setScreen('edit');
  };

  if (screen === 'detail' && detailId) {
    return (
      <View style={{ flex: 1 }}>
        <NewsDetailScreen id={detailId} onBack={goToList} />
      </View>
    );
  }

  if (screen === 'create') {
    return (
      <View style={{ flex: 1 }}>
        <CreateNewsScreen onBack={goToList} onSuccess={goToList} />
      </View>
    );
  }

  if (screen === 'edit' && editItem) {
    return (
      <View style={{ flex: 1 }}>
        <EditNewsScreen
          item={editItem}
          onBack={() => { setScreen('myposts'); setEditItem(null); }}
          onSuccess={() => { setScreen('myposts'); setEditItem(null); }}
        />
      </View>
    );
  }

  if (screen === 'myposts') {
    return (
      <View style={{ flex: 1 }}>
        <MyPostsScreen
          onBack={goToList}
          onEdit={(item) => goToEdit(item)}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <NewsListScreen
        onSelect={goToDetail}
        onMyPosts={goToMyPosts}
        onCreate={goToCreate}
      />
      <BottomNavBar activeRoute="/news" />
    </View>
  );
}
