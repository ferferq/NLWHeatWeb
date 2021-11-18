import { LoginBox } from './components/LoginBox';
import { MessageList } from './components/MessageList';
import { SendMessageForm } from './components/SendMessageForm';
import { useAuth } from './hooks/auth';
import styles from './styles/App.module.scss';

export function App() {
  const {user} = useAuth();

  return (
    <main className={`${styles.contentWrapper} ${!!user && styles.contentSigned}`}>
      <MessageList />
      { !!user ? 
        <SendMessageForm /> 
        : 
        <LoginBox  />
      }
    </main>
  )
}
