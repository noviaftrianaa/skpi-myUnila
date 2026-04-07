package project

import (
	"fmt"
	"log"
	"net/http"
	"net/url"
)

// TelegramNotifier sends notifications to a Telegram bot
type TelegramNotifier struct {
	BotToken string
	ChatID   string
	Enabled  bool
}

// NewTelegramNotifier creates a new TelegramNotifier
func NewTelegramNotifier(botToken, chatID string, enabled bool) *TelegramNotifier {
	return &TelegramNotifier{BotToken: botToken, ChatID: chatID, Enabled: enabled}
}

// Send sends a message to Telegram asynchronously (fire-and-forget)
func (n *TelegramNotifier) Send(message string) {
	if !n.Enabled || n.BotToken == "" || n.ChatID == "" {
		return
	}
	go func() {
		apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", n.BotToken)
		resp, err := http.PostForm(apiURL, url.Values{
			"chat_id":    {n.ChatID},
			"text":       {message},
			"parse_mode": {"HTML"},
		})
		if err != nil {
			log.Printf("⚠️ Telegram notify error: %v", err)
			return
		}
		defer resp.Body.Close()
	}()
}
