import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ConfigService } from '@nestjs/config'
import { Usuario } from './entities/usuario.entity';
import * as bcrypt from 'bcrypt';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class UsuarioService {

  private defaultLimit: number
  constructor(

    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<Usuario>,

    private readonly configService: ConfigService

  ) {
    this.defaultLimit = this.configService.get<number>('defaultLimit')
  }


  async create(createUsuarioDto: CreateUsuarioDto) {
    createUsuarioDto.email = createUsuarioDto.email.toLocaleLowerCase();
    createUsuarioDto.password = await bcrypt.hash(createUsuarioDto.password, 10);

    try {
      const usuario = await this.usuarioModel.create(createUsuarioDto);
      const userObject = usuario.toObject();
      delete userObject.password;
      delete userObject.__v;
      return userObject;

    } catch (error) {
      this.handleExceptions(error);
    }

  }



  async findAll(paginationDto: PaginationDto) {

    const { limit = this.defaultLimit, offset = 0 } = paginationDto;

    try {
      const users = this.usuarioModel.find()
        .limit(limit)
        .skip(offset)
        .select('-password -__v');

      if (!users) {
        throw new NotFoundException('No existen usuarios');
      }

      return users;
    } catch (error) {
      throw new NotFoundException(error.response);
    }

  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`invalid id`);
    }

    try {
      const user = await this.usuarioModel.findOne({ _id: id }, { _id: 1, email: 1 });

      if (!user) {
        throw new NotFoundException(`usuario with id "${id}" not found`);
      }

      return user;

    } catch (error) {
      throw new NotFoundException(error.response);
    }
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {

    if (!isValidObjectId(id)) {
      throw new BadRequestException(`invalid id`);
    }
    try {
      const user = await this.usuarioModel.findByIdAndUpdate(id, updateUsuarioDto, { new: true })
        .select('-password -__v')
        .exec();

      if (!user) {
        throw new NotFoundException('No se encontro el usuario que se intenta actualizar');
      }
      return user;
    } catch (error) {
      throw new NotFoundException(error.response);
    }
  }

  async remove(id: string) {

    if (!isValidObjectId(id)) {
      throw new BadRequestException(`invalid id`);
    }
    try {
      const user = await this.usuarioModel.findByIdAndRemove(id).select('-password -__v').exec();

      if (!user) {
        throw new NotFoundException('No se encontro el usuario que se intenta eliminar');
      }

      return user;
    } catch (error) {
      throw new NotFoundException(error.response);
    }

  }


  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`usuario exists in db ${JSON.stringify(error.keyValue)}`);
    }
    throw new InternalServerErrorException(`Can't create usuario - Check server logs`);
  }

}
