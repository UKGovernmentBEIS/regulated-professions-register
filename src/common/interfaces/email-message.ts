export interface EmailMessage {
  data: {
    email: string;
    templateID: string;
    personalisation: {
      subject: string;
      body: string;
    };
  };
}
