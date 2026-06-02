from sqlalchemy import func, select
from sqlalchemy.orm import Session as DbSession, selectinload

from app.models.session import Session
from app.schemas.session import SessionCreate, SessionUpdate


class SessionService:
    def __init__(self, db: DbSession):
        self.db = db

    def list_sessions(self, page: int = 1, page_size: int = 50) -> tuple[list[Session], int]:
        offset = (page - 1) * page_size
        total = self.db.scalar(select(func.count()).select_from(Session)) or 0
        items = list(
            self.db.scalars(
                select(Session)
                .order_by(Session.updated_at.desc())
                .offset(offset)
                .limit(page_size)
            ).all()
        )
        return items, total

    def create_session(self, data: SessionCreate) -> Session:
        session = Session(title=data.title or "新对话")
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def get_session(self, session_id: str) -> Session | None:
        return self.db.scalar(
            select(Session)
            .options(selectinload(Session.messages))
            .where(Session.id == session_id)
        )

    def update_session(self, session_id: str, data: SessionUpdate) -> Session | None:
        session = self.db.get(Session, session_id)
        if not session:
            return None
        session.title = data.title
        self.db.commit()
        self.db.refresh(session)
        return session

    def delete_session(self, session_id: str) -> bool:
        session = self.db.get(Session, session_id)
        if not session:
            return False
        self.db.delete(session)
        self.db.commit()
        return True
