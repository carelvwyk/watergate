//read: https://aws.amazon.com/blogs/compute/announcing-go-support-for-aws-lambda/

package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func callGate(gateNumber string) error {
	twilioAccountSID, twilioAuthToken, sourceNum :=
		os.Getenv("TWILIO_ACCOUNT_SID"), os.Getenv("TWILIO_AUTH_TOKEN"),
		os.Getenv("SOURCE_NUMBER")
	if sourceNum[0:3] != "+27" {
		return errors.New("SOURCE_NUMBER must start with +27")
	}
	if gateNumber[0:3] != "+27" {
		return errors.New("Gate number must start with +27")
	}

	apiURI := "https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSID +
		"/Calls.json"

	data := url.Values{}
	data.Set("To", gateNumber)
	data.Set("From", sourceNum)
	// https://github.com/TwilioDevEd/api-snippets/blob/master/twiml/voice/your-response/your-response-1/output/your-response-1.twiml
	data.Set("Url", "https://raw.githubusercontent.com/TwilioDevEd/api-snippets/master/twiml/voice/your-response/your-response-1/output/your-response-1.twiml")
	req, err := http.NewRequest(http.MethodPost, apiURI,
		strings.NewReader(data.Encode()))
	req.SetBasicAuth(twilioAccountSID, twilioAuthToken)
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

// GateReqest contains information about which gate to open
type GateReqest struct {
	GateID string `json:"gate_id"`
}

func gateOpenHandler(req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	log.Printf("Received request: %v", req)
	var gr GateReqest
	if err := json.Unmarshal([]byte(req.Body), &gr); err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, err
	}
	gateNumber := os.Getenv("GATENUM_" + strings.ToUpper(gr.GateID))
	if gateNumber == "" {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, fmt.Errorf("No gate with ID %s", gr.GateID)
	}
	if err := callGate(gateNumber); err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, err
	}
	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body:       fmt.Sprintf("Opening %s gate", gr.GateID),
	}, nil
}

func main() {
	lambda.Start(gateOpenHandler)
}
