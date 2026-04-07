package webhook

import "time"

// BitbucketPushEvent represents a Bitbucket push webhook payload
type BitbucketPushEvent struct {
	Actor      BitbucketActor      `json:"actor"`
	Repository BitbucketRepository `json:"repository"`
	Push       BitbucketPush       `json:"push"`
}

type BitbucketActor struct {
	DisplayName string `json:"display_name"`
	UUID        string `json:"uuid"`
	AccountID   string `json:"account_id"`
}

type BitbucketRepository struct {
	Type     string            `json:"type"`
	Name     string            `json:"name"`
	FullName string            `json:"full_name"`
	Links    BitbucketLinks    `json:"links"`
	Owner    BitbucketActor    `json:"owner"`
	Scm      string            `json:"scm"`
	IsPrivate bool             `json:"is_private"`
}

type BitbucketPush struct {
	Changes []BitbucketChange `json:"changes"`
}

type BitbucketChange struct {
	Old     *BitbucketRef    `json:"old"`
	New     *BitbucketRef    `json:"new"`
	Commits []BitbucketCommit `json:"commits"`
}

type BitbucketRef struct {
	Type   string         `json:"type"`
	Name   string         `json:"name"`
	Target BitbucketTarget `json:"target"`
}

type BitbucketTarget struct {
	Type    string    `json:"type"`
	Hash    string    `json:"hash"`
	Message string    `json:"message"`
	Date    time.Time `json:"date"`
	Author  BitbucketCommitAuthor `json:"author"`
}

type BitbucketCommit struct {
	Hash    string                `json:"hash"`
	Message string                `json:"message"`
	Date    time.Time             `json:"date"`
	Author  BitbucketCommitAuthor `json:"author"`
	Links   BitbucketCommitLinks  `json:"links"`
}

type BitbucketCommitAuthor struct {
	Raw  string         `json:"raw"`
	User *BitbucketUser `json:"user"`
}

type BitbucketUser struct {
	DisplayName string `json:"display_name"`
	UUID        string `json:"uuid"`
}

type BitbucketCommitLinks struct {
	HTML BitbucketHref `json:"html"`
}

type BitbucketHref struct {
	Href string `json:"href"`
}

type BitbucketLinks struct {
	HTML  BitbucketHref `json:"html"`
	Clone []BitbucketCloneLink `json:"clone"`
}

type BitbucketCloneLink struct {
	Href string `json:"href"`
	Name string `json:"name"`
}
