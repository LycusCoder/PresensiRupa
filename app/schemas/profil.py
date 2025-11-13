from pydantic import BaseModel


class ResponseDaftarWajah(BaseModel):
    """
    Schema untuk response POST /profil/daftar-wajah.
    """
    status: str
    pesan: str
