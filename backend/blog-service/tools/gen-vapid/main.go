// Generate VAPID keypair untuk web push (Phase BA).
// Run sekali, copy output ke .env:
//   WEBPUSH_PUBLIC_KEY=...
//   WEBPUSH_PRIVATE_KEY=...
//
// Usage: go run ./tools/gen-vapid

package main

import (
	"fmt"

	webpush "github.com/SherClockHolmes/webpush-go"
)

func main() {
	priv, pub, err := webpush.GenerateVAPIDKeys()
	if err != nil {
		panic(err)
	}
	fmt.Println("# Generated VAPID keypair. Tambah ke .env blog-service:")
	fmt.Println("WEBPUSH_PUBLIC_KEY=" + pub)
	fmt.Println("WEBPUSH_PRIVATE_KEY=" + priv)
	fmt.Println("WEBPUSH_SUBJECT=mailto:dev@unila.ac.id")
	fmt.Println()
	fmt.Println("# Frontend juga butuh public key — set di .env.local:")
	fmt.Println("NEXT_PUBLIC_VAPID_PUBLIC_KEY=" + pub)
}
