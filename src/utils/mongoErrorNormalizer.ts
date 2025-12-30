export class MongoErrorNormalizer {
  public name: string = "";
  public mongoErrorCode: number | null = null;
  public message: string = "";
  public level: string = "error";
  public timestamp: string = "";
  public tracer: string = "";

  constructor(props: any) {
    if (props.code === 11000) {
      const key = props.keyValue ? Object.keys(props.keyValue)[0] : "value";
      this.message = `${key} already exists`;
    } else {
      this.message = props.message;
    }

    this.name = props.name;
    this.tracer = props.tracer || "";
    this.timestamp = props.timestamp;
    this.mongoErrorCode = props.code ? props.code : null;
  }
}
