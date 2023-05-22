import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  ValidationPipe,
} from '@nestjs/common'
import { ObjectId } from 'bson'

@Injectable()
export class ObjectIdToStringPipe
  extends ValidationPipe
  implements PipeTransform<any>
{
  async transform(value: any, metadata: ArgumentMetadata) {
    // Convert ObjectId to string if the value is an ObjectId
    if (metadata.type === 'param' && ObjectId.isValid(value)) {
      return value.toString()
    }

    // Use the default behavior of the ValidationPipe for other cases
    return super.transform(value, metadata)
  }
}
