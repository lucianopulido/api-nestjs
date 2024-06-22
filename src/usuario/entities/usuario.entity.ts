import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Usuario extends Document {

    @Prop({ unique: true, required: true })
    email: string;

    @Prop({ required: true })
    password: string;

}


export const UsuarioSchema = SchemaFactory.createForClass(Usuario);