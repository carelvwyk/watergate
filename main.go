//read: https://aws.amazon.com/blogs/compute/announcing-go-support-for-aws-lambda/

package main

import (
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/lambda"
)

func call() error {
	twilioKeyID, twilioKeySecret, sourceNum, targetNum :=
		os.Getenv("TWILIO_KEY_ID"), os.Getenv("TWILIO_KEY_SECRET"),
		os.Getenv("SOURCE_NUMBER"), os.Getenv("TARGET_NUMBER")
	if sourceNum[0:3] != "+27" {
		return errors.New("SOURCE_NUMBER must start with +27")
	}
	if targetNum[0:3] != "+27" {
		return errors.New("TARGET_NUMBER must start with +27")
	}

	apiURI := "https://api.twilio.com/2010-04-01/Accounts/" + twilioKeyID +
		"/Calls.json"

	data := url.Values{}
	data.Set("To", targetNum)
	data.Set("From", sourceNum)
	// https://github.com/TwilioDevEd/api-snippets/blob/master/twiml/voice/your-response/your-response-1/output/your-response-1.twiml
	data.Set("Url", "https://raw.githubusercontent.com/TwilioDevEd/api-snippets/master/twiml/voice/your-response/your-response-1/output/your-response-1.twiml")
	req, err := http.NewRequest(http.MethodPost, apiURI,
		strings.NewReader(data.Encode()))
	req.SetBasicAuth(twilioKeyID, twilioKeySecret)
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	bodyText, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	log.Println(string(bodyText))
	if resp.StatusCode != 201 {
		return fmt.Errorf("Unexpected status code returned by API: %d",
			resp.StatusCode)
	}
	return nil
}

func handler() {
	if err := call(); err != nil {
		log.Fatal(err)
	}
}

func main() {
	lambda.Start(handler)
}
