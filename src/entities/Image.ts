// @collapse

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Comment } from './Comment';

@Entity()
export class Image {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    imageUrl!: string;

    @Column({ nullable: true })
    metadata?: string;

    // Comments
    @OneToMany(()=>Comment, (Comment) => Comment.image)
    comments!: Comment[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
